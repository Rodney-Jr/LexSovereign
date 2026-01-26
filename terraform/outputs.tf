output "silo_region" {
  value = "af-south-1"
}

output "kms_key_arn" {
  value = aws_kms_key.silo_root_key.arn
}

output "vault_bucket_name" {
  value = aws_s3_bucket.sovereign_vault.id
}
