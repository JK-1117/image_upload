<script>
import PhotoIcon from "./PhotoIcon.vue";

const events = ["dragenter", "dragover", "dragleave", "drop"];
let inActiveTimeout = null;
export default {
  name: "ImageUpload",
  components: { PhotoIcon },
  props: ["max_size"],
  data() {
    return {
      active: false,
      error: "",
      uploadedImg: null,
      imagePreview: "",
      progress: 0,
      imgUrl: "",
    };
  },
  mounted() {
    events.forEach((eventName) => {
      document.body.addEventListener(eventName, (e) => e.preventDefault());
    });
  },
  unmounted() {
    events.forEach((eventName) => {
      document.body.removeEventListener(eventName, preventDefaults);
    });
  },
  computed: {
    imageSize() {
      if (!this.uploadedImg) {
        return "";
      }
      if (this.uploadedImg.size < 1024) {
        return this.uploadedImg.size.toFixed(2) + "Bytes";
      }
      if (this.uploadedImg.size < 1024 * 1024) {
        return (this.uploadedImg.size / 1024).toFixed(2) + "KB";
      }
      return (this.uploadedImg.size / 1024 / 1024).toFixed(2) + "MB";
    },
  },
  methods: {
    onClear(evt) {
      this.uploadedImg = null;
      this.imagePreview = "";
    },
    onDrop(evt) {
      this.setActive(false);
      if (!evt.dataTransfer.files || evt.dataTransfer.files.length === 0) {
        return;
      }
      const file = evt.dataTransfer.files[0];
      if (file.type.indexOf("image/") === -1) {
        this.error = "Only images files are allowed.";
        return;
      }
      if (this.max_size && file.size / 1024 / 1024 > this.max_size) {
        this.error = `You can only upload file up to ${this.max_size}MB`;
        return;
      }
      this.error = "";
      this.uploadedImg = file;
      this.imagePreview = URL.createObjectURL(file);
    },
    onUpload() {
      const payload = new FormData();
      payload.append("file", this.uploadedImg, this.uploadedImg.name);
      payload.append("is_private", 0);
      payload.append("folder", "Home/Attachments");
      this.progress = 0;
      this.error = "";

      $.ajax({
        type: "POST",
        url: "/api/method/upload_file",
        headers: {
          Accept: "application/json",
          "X-Frappe-CSRF-Token": frappe.csrf_token,
        },
        xhr: () => {
          var myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
            myXhr.upload.addEventListener(
              "progress",
              this.progressHandling,
              false
            );
          }
          return myXhr;
        },
        success: (res) => {
          this.imgUrl = window.location.origin + res.message.file_url;
          this.progress = 0;
          frappe.show_alert({
            message: "Upload Success!",
            indicator: "green",
          });
        },
        error: (error) => {
          this.error = "Opps! Something went wrong. Please try again later.";
          this.progress = 0;
          this.imgUrl = null;
          console.error(error);
        },
        async: true,
        data: payload,
        cache: false,
        contentType: false,
        processData: false,
      });
    },
    progressHandling(event) {
      var position = event.loaded || event.position;
      var total = event.total;
      if (event.lengthComputable) {
        this.progress = Math.ceil((position / total) * 100);
        frappe.show_progress("Uploading...", this.progress, 100, "", true);
      }
    },
    setActive(active) {
      if (active) {
        clearTimeout(inActiveTimeout);
        this.active = active;
        return;
      }
      inActiveTimeout = setTimeout(() => {
        this.active = active;
      }, 50);
    },
  },
};
</script>
<template>
  <div>
    <label
      for="upload-image"
      class="block text-sm font-medium leading-6 text-gray-900"
    >
      Upload Image
    </label>
    <div
      class="bg-red-100 text-red-900 p-2 rounded-md text-sm font-bold"
      v-show="error"
    >
      {{ error }}
    </div>
    <div class="flex gap-2" v-if="uploadedImg">
      <img
        class="object-contain rounded-md h-40 w-40"
        :src="imagePreview"
        :alt="uploadedImg.name"
      />
      <div class="flex flex-col justify-center pr-6 border-r border-gray-300">
        <p class="text-sm font-bold">{{ uploadedImg.name }}</p>
        <p class="text-sm">{{ imageSize }}</p>
      </div>
      <div class="pl-6 flex gap-x-6 items-center">
        <a v-if="imgUrl" class="text-indigo-500" :href="imgUrl">
          <span class="text-gray-600 inline-block">
            You may share or save this link for future access:
          </span>
          <br />
          {{ imgUrl }}
        </a>
        <div v-if="progress > 0" class="text-indigo-500">{{ progress }}%</div>
        <div class="flex gap-x-6 items-center" v-if="!progress && !imgUrl">
          <button class="btn" @click="onUpload">Upload</button>
          <button
            type="button"
            class="text-sm font-semibold leading-6 text-gray-900"
            @click="onClear"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
    <div
      class="file-uploader-wrapper"
      :class="{ 'file-uploader-active': active }"
      v-show="!uploadedImg"
      @dragenter.prevent="setActive(true)"
      @dragover.prevent="setActive(true)"
      @dragleave.prevent="setActive(false)"
      @drop.prevent="onDrop"
    >
      <div class="text-center">
        <PhotoIcon class="file-uploader-icon" aria-hidden="true" />
        <div class="file-uploader-content">
          <label for="file-upload" class="file-uploader-label">
            <span>Upload a file</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              class="sr-only"
            />
          </label>
          <p class="pl-1">or drag and drop</p>
        </div>
        <p class="file-uploader-description">
          PNG, JPG, GIF <span v-if="max_size">up to {{ max_size }}MB</span>
        </p>
      </div>
    </div>
  </div>
</template>
