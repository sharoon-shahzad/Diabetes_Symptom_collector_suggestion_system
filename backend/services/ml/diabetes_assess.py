import sys, json, os
from pathlib import Path

PROJECT_ROOT = os.getenv('PROJECT_ROOT')
if PROJECT_ROOT:
    sys.path.append(str(Path(PROJECT_ROOT) / 'Diabetes Model Making'))

try:
    from EnhancedDiabetesSystem import DiabetesRiskAssessmentSystem
except Exception as e:
    print(json.dumps({"error": f"Import failed: {str(e)}"}))
    sys.exit(1)

def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw else {}
        features = payload.get('features', {})

        # Load model from Diabetes Model Making directory
        model_path = str(Path(PROJECT_ROOT or '.') / 'Diabetes Model Making' / 'diabetes_xgb_model.pkl')
        system = DiabetesRiskAssessmentSystem(model_path=model_path)
        result = system.predict_risk_with_confidence(features)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()


