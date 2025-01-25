
import azure.functions as func 
import json
from flask import Flask, request, Response, redirect, url_for 

flask_app = Flask(__name__) 

@flask_app.get("/try_get") 
def get_try(): 
    return Response('<h1>Hello World™</h1>', mimetype='text/html') 

@flask_app.post("/phone_hook") 
def return_http(): 
    print(request.get_data())

    return Response('<h1>Hello World™</h1>', mimetype='text/html') 


app = func.WsgiFunctionApp(app=flask_app.wsgi_app, 
                           http_auth_level=func.AuthLevel.ANONYMOUS)