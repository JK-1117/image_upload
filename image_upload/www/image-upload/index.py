import frappe


def get_context(context):
    context.max_size = (
        frappe.get_value("System Settings", "System Settings", "max_file_size") or ""
    )
