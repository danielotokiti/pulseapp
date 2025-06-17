variable "s3_bucket_name" {
  description = "The globally unique name for the S3 bucket where the React app will be hosted."
  type        = string
  # IMPORTANT: S3 bucket names must be globally unique across ALL of AWS.
}