import ImageUploadComponent from "./ImageUpload.vue";

class ImageUploader {
	constructor(wrapper, max_size) {
		this.$wrapper = $(wrapper);

		let $vm = new Vue({
			el: this.$wrapper.get(0),
			render: (h) =>
				h(ImageUploadComponent, {
					max_size
				}),
		});
		this.$component = $vm.$children[0];
	}
}

frappe.provide("frappe.imageupload");
frappe.imageupload.ImageUploader = ImageUploader;
export default ImageUploader;
