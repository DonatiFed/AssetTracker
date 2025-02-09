# Usa un'immagine ufficiale Python
FROM python:3.10

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia i file del progetto dentro il container
COPY . .

# Installa i pacchetti necessari
RUN pip install --no-cache-dir -r requirements.txt

# Espone la porta per Django
EXPOSE 8000

# Comando di default
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
