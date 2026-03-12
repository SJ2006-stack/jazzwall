FROM vexaai/vexa-lite:latest AS base

# Fix Pydantic
RUN pip install --upgrade pydantic==2.7.1 fastapi==0.111.0 pydantic-settings==2.3.4

# Remove unnecessary files to shrink image
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/* && \
    rm -rf /root/.cache && \
    find / -name "*.pyc" -delete && \
    find / -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true