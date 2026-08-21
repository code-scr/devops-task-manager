resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name    = "${var.project_name}-frontend"
    Project = var.project_name
  }
}

data "aws_caller_identity" "current" {}