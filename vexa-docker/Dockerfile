FROM vexaai/vexa-lite:latest

# Fix Pydantic v1/v2 conflict
RUN pip install --upgrade pydantic==2.7.1 fastapi==0.111.0 pydantic-settings==2.3.4

CMD ["/start.sh"]