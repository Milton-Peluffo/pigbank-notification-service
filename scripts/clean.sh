#!/bin/bash

# Script para limpiar build outputs y cache
# Uso: bash scripts/clean.sh

echo "Cleaning build outputs..."

rm -rf dist/
rm -rf zips/
rm -rf .terraform/
rm -rf *.tfplan
rm -rf infrastructure/terraform/.terraform/

echo "GOOD Cleaning completed"
