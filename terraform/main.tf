terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "af-south-1"
  alias  = "sovereign_silo"

  default_tags {
    tags = {
      Project     = "LexSovereign"
      Jurisdiction = "Ghana"
      Compliance   = "DataSovereignty"
    }
  }
}

resource "aws_kms_key" "silo_root_key" {
  provider = aws.sovereign_silo
  description             = "Sovereign Root Key for Ghana Silo"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "SiloRootKey-GH"
  }
}

resource "aws_s3_bucket" "sovereign_vault" {
  provider = aws.sovereign_silo
  bucket_prefix = "lexsovereign-vault-gh-"

  tags = {
    Name = "SovereignVault"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "vault_crypto" {
  provider = aws.sovereign_silo
  bucket = aws_s3_bucket.sovereign_vault.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.silo_root_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "vault_block" {
  provider = aws.sovereign_silo
  bucket = aws_s3_bucket.sovereign_vault.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
