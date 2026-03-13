FROM vexaai/vexa-lite:latest

# Fix supervisor config
RUN sed -i 's/ADMIN_API_TOKEN="%(ENV_ADMIN_API_TOKEN)s"/ADMIN_API_TOKEN="%(ENV_VEXA_TOKEN)s"/g' /etc/supervisor/conf.d/vexa.conf

# Remove old pydantic binaries completely
RUN find /usr/local/lib/python3.10/dist-packages -name "pydantic*" -exec rm -rf {} + 2>/dev/null || true
RUN find /usr/local/lib/python3.10/dist-packages -name "fastapi*" -exec rm -rf {} + 2>/dev/null || true

# Fresh install
RUN pip install pydantic==2.7.1 fastapi==0.111.0 pydantic-settings==2.3.4