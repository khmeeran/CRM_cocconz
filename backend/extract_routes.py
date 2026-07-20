import sys
import os
import json
import inspect
from fastapi import FastAPI
from fastapi.routing import APIRoute

# Add the backend directory to the path so we can import from it
sys.path.insert(0, os.path.abspath("."))

try:
    from main import app
except Exception as e:
    print(f"Error importing app: {e}")
    sys.exit(1)

routes_info = []
for route in app.routes:
    if isinstance(route, APIRoute):
        methods = ",".join(route.methods)
        path = route.path
        
        # Try to find request/response models
        req_model = route.body_field.type_.__name__ if route.body_field else "None"
        res_model = route.response_model.__name__ if hasattr(route.response_model, "__name__") else str(route.response_model)
        
        # Check for dependencies to guess auth
        auth_required = "Depends(get_current_user" in str(route.dependencies) or "get_current_active_user" in str(route.dependencies)
        if not auth_required:
            auth_required = any("Depends" in str(dep) for dep in route.dependencies)
            
        source_file = inspect.getsourcefile(route.endpoint)
        if source_file:
            source_file = os.path.basename(source_file)
        
        routes_info.append({
            "method": methods,
            "path": path,
            "auth": str(auth_required),
            "req": req_model,
            "res": res_model,
            "file": source_file
        })

print(json.dumps(routes_info, indent=2))
