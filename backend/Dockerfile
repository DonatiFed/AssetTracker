# Usa un'immagine ufficiale Python
FROM python:3.10
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia solo i file necessari per installare le dipendenze
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ora copia tutto il codice del progetto
COPY . .



# Espone la porta per Django
EXPOSE 8000

# Carica manualmente le variabili d'ambiente
ENV DATABASE_URL=${DATABASE_URL}

# Comando di avvio
CMD ["sh", "-c", "echo DATABASE_URL: $DATABASE_URL && python manage.py migrate && python manage.py dbshell"]
