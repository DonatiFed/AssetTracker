# Usa un'immagine ufficiale Python
FROM python:3.10

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia solo i file necessari per installare le dipendenze
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ora copia tutto il codice del progetto
COPY . .

# Imposta le variabili d'ambiente per la produzione
ENV PYTHONUNBUFFERED=1

# Colleziona i file statici prima dell'avvio
RUN python manage.py collectstatic --noinput

# Espone la porta per Django
EXPOSE 8000

# Carica manualmente le variabili d'ambiente
ENV DATABASE_URL=${DATABASE_URL}

# Comando di avvio
CMD ["sh", "-c", "echo DATABASE_URL: $DATABASE_URL && python manage.py migrate && gunicorn myproject.wsgi:application --bind 0.0.0.0:8000"]
