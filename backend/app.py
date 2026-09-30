from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

# Initialize extensions
from models import db, User, AnalysisReport
login_manager = LoginManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__, 
                template_folder='../frontend/templates',
                static_folder='../frontend/static',
                static_url_path='/static')
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    default_db_url = 'postgresql://postgres:password@localhost/agroconnect'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', default_db_url)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    bcrypt.init_app(app)
    
    login_manager.login_view = 'login_page'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
        
    # --- TEMPLATE ROUTES ---
    @app.route('/')
    def index():
        return render_template('index.html')
        
    @app.route('/login')
    def login_page():
        return render_template('login.html')
        
    @app.route('/register')
    def register_page():
        return render_template('register.html')
        
    @app.route('/dashboard')
    @login_required
    def dashboard():
        return render_template('dashboard.html')
        
    @app.route('/soil-health')
    @login_required
    def soil_health():
        return render_template('soil-health.html')
        
    @app.route('/crop-rec')
    @login_required
    def crop_rec():
        return render_template('crop-rec.html')
        
    @app.route('/yield-prediction')
    @login_required
    def yield_prediction():
        return render_template('yield-prediction.html')
        
    @app.route('/irrigation')
    @login_required
    def irrigation():
        return render_template('irrigation.html')
        
    @app.route('/weather')
    @login_required
    def weather():
        return render_template('weather.html')
        
    @app.route('/farm-reports')
    @login_required
    def farm_reports():
        return render_template('farm-reports.html')
        
    @app.route('/analytics')
    @login_required
    def analytics():
        return render_template('analytics.html')

    # --- API ROUTES ---
    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        
        # Check if mobile already exists
        existing_user = User.query.filter_by(mobile_number=data.get('mobile')).first()
        if existing_user:
            return jsonify({'success': False, 'message': 'Mobile number already registered.'}), 400
            
        hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
        
        new_user = User(
            farmer_name=data.get('name'),
            mobile_number=data.get('mobile'),
            password_hash=hashed_password,
            village=data.get('village', ''),
            district=data.get('district', ''),
            farm_name=data.get('farm', ''),
            farm_size=float(data.get('acres', 0)) if data.get('acres') else None,
            primary_crop=data.get('crop', '')
        )
        
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Registration successful!'})

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(mobile_number=data.get('mobile')).first()
        
        if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
            login_user(user)
            # Return basic user info for frontend initial load if needed
            user_data = {
                'name': user.farmer_name,
                'mobile': user.mobile_number,
                'farm': user.farm_name,
                'size': user.farm_size,
                'crop': user.primary_crop
            }
            return jsonify({'success': True, 'message': 'Login successful!', 'user': user_data})
        else:
            return jsonify({'success': False, 'message': 'Invalid mobile number or password.'}), 401

    @app.route('/logout')
    def logout():
        logout_user()
        from flask import redirect, url_for
        return redirect(url_for('index'))
        
    @app.route('/api/user/profile', methods=['GET'])
    @login_required
    def get_profile():
        user_data = {
            'name': current_user.farmer_name or 'Farmer',
            'mobile': current_user.mobile_number,
            'farm': current_user.farm_name or 'Farm',
            'size': current_user.farm_size or 0,
            'crop': current_user.primary_crop or '-',
            'village': current_user.village or '-',
            'district': current_user.district
        }
        return jsonify({'success': True, 'user': user_data})
        
    @app.route('/api/user/profile/update', methods=['POST'])
    @login_required
    def update_profile():
        data = request.get_json()
        current_user.farmer_name = data.get('name', current_user.farmer_name)
        current_user.farm_name = data.get('farm', current_user.farm_name)
        current_user.village = data.get('village', current_user.village)
        try:
            current_user.farm_size = float(data.get('size'))
        except (ValueError, TypeError):
            pass
        current_user.primary_crop = data.get('crop', current_user.primary_crop)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Profile updated successfully'})

    @app.route('/api/analysis/save', methods=['POST'])
    @login_required
    def save_analysis():
        data = request.get_json()
        analysis_type = data.get('type')
        results = data.get('results')
        inputs = data.get('inputs', {})
        
        # Server-side validation for 'Field & Soil Metrics'
        if analysis_type == 'Field & Soil Metrics':
            farm_size = inputs.get('farm_size')
            soil = inputs.get('soil')
            water = inputs.get('water')
            
            if not farm_size or float(farm_size) <= 0:
                return jsonify({'success': False, 'message': 'Farm Size must be a positive number.'}), 400
                
            if soil not in ['black', 'alluvial', 'red', 'sandy']:
                return jsonify({'success': False, 'message': 'Invalid Soil Type.'}), 400
                
            if water not in ['rain', 'tubewell', 'canal']:
                return jsonify({'success': False, 'message': 'Invalid Water Source.'}), 400
        
        report = AnalysisReport(
            user_id=current_user.id,
            analysis_type=analysis_type,
            input_data=inputs,
            result_data={"input": inputs, "output": results}
        )
        db.session.add(report)
        db.session.commit()
        return jsonify({'success': True})

    @app.route('/api/reports', methods=['GET'])
    @login_required
    def get_reports():
        reports = AnalysisReport.query.filter_by(user_id=current_user.id).order_by(AnalysisReport.created_at.desc()).all()
        report_list = []
        for r in reports:
            report_list.append({
                'type': r.analysis_type,
                'date': r.created_at.isoformat() if r.created_at else '',
                'input': r.result_data.get('input', {}),
                'output': r.result_data.get('output', {})
            })
        return jsonify({'success': True, 'reports': report_list})

    @app.route('/api/analytics/summary', methods=['GET'])
    @login_required
    def get_analytics_summary():
        reports = AnalysisReport.query.filter_by(user_id=current_user.id).all()
        
        soil_data = []
        water_data = []
        roi_data = []
        yield_trend_data = []
        
        for r in reports:
            # Merge input sources (input_data column and result_data['input'])
            inp = {}
            if isinstance(r.input_data, dict):
                inp.update(r.input_data)
            if isinstance(r.result_data, dict) and isinstance(r.result_data.get('input'), dict):
                for k, v in r.result_data['input'].items():
                    if k not in inp or inp[k] is None:
                        inp[k] = v
                        
            # Normalize keys to lowercase stripped strings
            norm_inp = {str(k).strip().lower(): v for k, v in inp.items()}
            
            # Extract farm size
            farm_size = (norm_inp.get('farm_size') or 
                         norm_inp.get('size') or 
                         norm_inp.get('farm size (acres)') or 
                         norm_inp.get('farm size'))
            
            if farm_size is None or farm_size == '':
                farm_size = r.farmer.farm_size if r.farmer else None
            
            try:
                farm_size = float(farm_size) if farm_size is not None else 0
            except (ValueError, TypeError):
                farm_size = 0
                
            if r.analysis_type == 'Field & Soil Metrics':
                soil = norm_inp.get('soil')
                water = norm_inp.get('water')
                if soil:
                    soil_data.append({'farm_size': farm_size, 'soil': str(soil).strip().lower()})
                if water:
                    water_data.append({'farm_size': farm_size, 'water': str(water).strip().lower()})
            elif r.analysis_type == 'Yield Prediction':
                crop = norm_inp.get('crop')
                if not crop and r.farmer:
                    crop = r.farmer.primary_crop
                    
                output_data = r.result_data.get('output', {}) if isinstance(r.result_data, dict) else {}
                norm_out = {str(k).strip().lower(): v for k, v in output_data.items()} if isinstance(output_data, dict) else {}
                
                profit = norm_out.get('profit')
                if profit is not None and crop:
                    try:
                        profit = float(profit)
                        roi_data.append({'farm_size': farm_size, 'crop': str(crop).strip(), 'profit': profit})
                    except (ValueError, TypeError):
                        pass
                
                total_yield = (norm_out.get('total_yield') or 
                               norm_out.get('totalyield') or 
                               norm_out.get('estimated yield') or 
                               norm_out.get('estimated_yield'))
                if total_yield is not None:
                    try:
                        if isinstance(total_yield, str):
                            total_yield = total_yield.replace('Tons', '').replace('tonnes', '').replace('T', '').strip()
                        total_yield = float(total_yield)
                        date_str = r.created_at.strftime('%Y-%m-%d %H:%M:%S') if r.created_at else ''
                        yield_trend_data.append({'farm_size': farm_size, 'date': date_str, 'total_yield': total_yield})
                    except (ValueError, TypeError):
                        pass
                        
        # Sort yield_trend_data by date ascending
        yield_trend_data.sort(key=lambda x: x['date'])
        
        return jsonify({
            'success': True,
            'soil_data': soil_data,
            'water_data': water_data,
            'roi_data': roi_data,
            'yield_trend_data': yield_trend_data
        })
    
    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
