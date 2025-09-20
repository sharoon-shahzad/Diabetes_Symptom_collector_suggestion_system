# Diabetes Risk Assessment ML Service

This directory contains the machine learning service for diabetes risk assessment integration.

## Setup

### Python Dependencies
Install the required Python packages:
```bash
pip install -r requirements.txt
```

### Model Files
Ensure the following files are present in the `Diabetes Model Making` directory:
- `diabetes_xgb_model.pkl` - The trained XGBoost model
- `EnhancedDiabetesSystem.py` - The diabetes assessment system class

## How It Works

1. **Node.js Backend** calls `assessDiabetesRiskPython()` in `mlService.js`
2. **Python Script** (`diabetes_assess.py`) receives feature data via stdin
3. **EnhancedDiabetesSystem** loads the model and makes predictions
4. **Results** are returned as JSON via stdout

## API Endpoint

- **POST** `/api/v1/assessment/diabetes`
- **Authentication**: Required (JWT token)
- **Response**: Risk assessment with probability, confidence, and recommendations

## Features

- Risk level classification (Low/Medium/High)
- Confidence scoring
- Personalized recommendations
- Feature importance analysis
- Symptom-specific guidance

## Error Handling

The service includes comprehensive error handling for:
- Python import failures
- Model loading errors
- Invalid input data
- JSON parsing errors

## Environment Variables

- `PYTHON_BIN`: Python executable path (default: 'python')
- `PROJECT_ROOT`: Project root directory for model path resolution
