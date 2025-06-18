resource "aws_s3_object" "pulse_app" {
  for_each = fileset("/home/whydvniel/pulse-app/", "**")

  bucket = aws_s3_bucket.pulse_app.id
  key    = each.value
  source = "/home/whydvniel/pulse-app/${each.value}"
  etag   = filemd5("/home/whydvniel/pulse-app/${each.value}")

  metadata = {
    cache-control = "no-cache"
  }

  content_type = lookup({
    html = "text/html"
    js   = "application/javascript"
    css  = "text/css"
    json = "application/json"
    png  = "image/png"
    jpg  = "image/jpeg"
    svg  = "image/svg+xml"
    ico  = "image/x-icon"
    map  = "application/json"
    woff = "font/woff"
    ttf  = "font/ttf"
  }, lower(trimspace(split(".", each.value)[length(split(".", each.value)) - 1])), "application/octet-stream")
}
