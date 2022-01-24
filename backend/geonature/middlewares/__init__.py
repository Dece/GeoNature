import uuid


class RequestID:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        req_id = str(uuid.uuid4())
        environ['FLASK_REQUEST_ID'] = req_id

        def new_start_response(status, response_headers, exc_info=None):
            response_headers.append(('X-Request-ID', req_id))
            return start_response(status, response_headers, exc_info)

        return self.app(environ, new_start_response)
