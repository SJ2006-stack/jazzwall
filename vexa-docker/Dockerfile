FROM vexaai/vexa-lite:latest

# Fix supervisor config — ADMIN_API_TOKEN → VEXA_TOKEN
RUN sed -i 's/ADMIN_API_TOKEN="%(ENV_ADMIN_API_TOKEN)s"/ADMIN_API_TOKEN="%(ENV_VEXA_TOKEN)s"/g' /etc/supervisor/conf.d/vexa.conf

# Force reinstall pydantic from source (no binary wheels)
RUN pip install --upgrade --force-reinstall --no-binary pydantic pydantic==2.7.1
RUN pip install --upgrade --force-reinstall --no-binary fastapi fastapi==0.111.0
RUN pip install --upgrade pydantic-settings==2.3.4