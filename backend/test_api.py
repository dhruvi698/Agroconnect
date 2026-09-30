from app import create_app
from models import db, User
app = create_app()
with app.app_context():
    # Find a user
    user = User.query.first()
    if user:
        client = app.test_client()
        with client.session_transaction() as sess:
            sess['_user_id'] = str(user.id)
            sess['_fresh'] = True
        
        # Test Invalid payload
        res = client.post('/api/analysis/save', json={
            'type': 'Field & Soil Metrics',
            'inputs': {'farm_size': '-5', 'soil': 'magic', 'water': 'none'},
            'results': {}
        })
        print("Invalid Payload Response:", res.status_code, res.get_json())
        
        # Test Valid Payload
        res = client.post('/api/analysis/save', json={
            'type': 'Field & Soil Metrics',
            'inputs': {'farm_size': '15.5', 'soil': 'black', 'water': 'rain'},
            'results': {'recommended_crop': 'Wheat'}
        })
        print("Valid Payload Response:", res.status_code, res.get_json())
        
        # Check get_reports
        res = client.get('/api/reports')
        reports = res.get_json()['reports']
        print("Num reports:", len(reports))
        print("Latest report:", reports[0])
