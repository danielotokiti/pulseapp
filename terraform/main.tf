# Configure the AWS Provider
provider "aws" {
  region = "us-east-2" 
}


terraform {
  backend "s3" {
    bucket         = "psentrybucket" # Change this to a unique bucket name
    key            = "prod/terraform.tfstate"
    region         = "us-east-2" 
    dynamodb_table = "terraform-locks" 
    encrypt        = true
  }
}


resource "aws_s3_bucket" "pulse_app" {
  bucket = var.s3_bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "pulse_app" {
  bucket = aws_s3_bucket.pulse_app.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.pulse_app.id

  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls  = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = aws_s3_bucket.pulse_app.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
    {
      Sid       = "PublicReadGetObject",
      Effect    = "Allow",
      Principal = {
        AWS = "arn:aws:iam::625083152506:user/TerraformAdmin",
      }
      Action    = "s3:GetObject",
      Resource  = "${aws_s3_bucket.pulse_app.arn}/*"
    }]
  })
}


resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "PulseS3OAC"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
  description                       = "OAC for S3 React"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.pulse_app.bucket_regional_domain_name
    origin_id   = "s3Origin"

    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3Origin"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

resource "aws_s3_bucket_policy" "pulse_policy" {
  bucket = aws_s3_bucket.pulse_app.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly",
        Effect    = "Allow",
        Principal = {
          Service = "cloudfront.amazonaws.com"
        },
        Action = "s3:GetObject",
        Resource = "${aws_s3_bucket.pulse_app.arn}/*",
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.cdn.arn
          }
        }
      }
    ]
  })
}