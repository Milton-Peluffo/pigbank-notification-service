# Data sources para comprimir los código Lambda compilado

data "archive_file" "lambda_send_notifications" {
  type            = "zip"
  source_dir      = "${path.module}/../../dist/handlers"
  output_path     = "${path.module}/../../zips/send-notifications.zip"
  output_file_mode = "0644"
}

data "archive_file" "lambda_send_notifications_error" {
  type            = "zip"
  source_dir      = "${path.module}/../../dist/handlers"
  output_path     = "${path.module}/../../zips/send-notifications-error.zip"
  output_file_mode = "0644"
}
