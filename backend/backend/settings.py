
from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
from datetime import timedelta
import logging

load_dotenv()  #importo variabili da file .env

print("DEBUG: DATABASE_URL =", os.getenv("DATABASE_URL"))
ERG1 = os.getenv("ERG1", "default_value")
PORT = os.getenv("PORT", "8000")

#per creare path nel progetto uso BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY')



logging.basicConfig(level=logging.DEBUG)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django.security.csrf': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django.db.backends': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}


# SECURITY WARNING: non runnare con debug on in production!
DEBUG = False

ALLOWED_HOSTS = ['backend.onrender.com','0.0.0.0', '127.0.0.1', 'localhost', 'assettracker-xdb8.onrender.com']

#Application

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'pages.apps.PagesConfig',  #app personalizzata
    'rest_framework',  #Django rest framework
    'rest_framework_simplejwt', #autenticazione con jwt
    'rest_framework.authtoken',
    'corsheaders',  #per autorizzare host della reactapp ad accedere(gestire richieste CORS)

]

class LogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        logging.warning(f"Richiesta ricevuta: {request.method} {request.path} - Dati: {getattr(request, 'body', '')}")
        return self.get_response(request)
#gestire flusso richieste http
MIDDLEWARE = [
    'backend.settings.LogMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls' #file che contiene definizione delle url principali

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        "DIRS": [os.path.join(BASE_DIR, "frontend", "build")],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
print("DATABASE_URL:", os.getenv("DATABASE_URL"))

DATABASES = {
    'default': dj_database_url.config(default=os.getenv('DATABASE_URL'))
}

# Forza il search_path dopo la configurazione
DATABASES['default']['OPTIONS'] = {'options': '-c search_path=public'}

if not DATABASES['default']:
    raise Exception("DATABASE_URL is not set correctly!")

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Permettiamo richieste da localhost:3000 (React)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://assettracker-frontend.onrender.com",
    "https://frontend.onrender.com",
    "https://assettracker-frontend.onrender.com",  # Assicurati che sia incluso
    "https://assettracker-xdb8.onrender.com"
]
CSRF_TRUSTED_ORIGINS = [
    "https://assettracker-frontend.onrender.com",
    "https://frontend.onrender.com",
    "https://backend.onrender.com",
    "https://assettracker-xdb8.onrender.com"
]
CORS_ALLOW_CREDENTIALS = True  # Permetti l'uso di cookie/token
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
]
CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
    "x-requested-with",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Credentials"
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
# Assicurati che Django trovi i file statici
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "frontend", "build", "static"),
]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"



# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'pages.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),  # Cambia questo valore se necessario
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}