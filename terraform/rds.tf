resource "aws_db_subnet_group" "mysql" {
  name = "${var.project_name}-mysql-subnet-group"

  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]

  tags = {
    Name    = "${var.project_name}-mysql-subnet-group"
    Project = var.project_name
  }
}


resource "aws_db_instance" "mysql" {
  identifier = "${var.project_name}-mysql"

  engine         = "mysql"
  engine_version = "8.0"

  instance_class = var.rds_instance_class

  allocated_storage     = 20
  max_allocated_storage = 20
  storage_type          = "gp3"

  db_name  = "taskmanager"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name = aws_db_subnet_group.mysql.name

  vpc_security_group_ids = [
    aws_security_group.rds.id
  ]

  publicly_accessible = false

  multi_az = false

  backup_retention_period = 0

  deletion_protection = false

  skip_final_snapshot = true

  storage_encrypted = true

  tags = {
    Name    = "${var.project_name}-mysql"
    Project = var.project_name
  }
}