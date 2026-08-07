import logging, os
def setup_logger(path=None):
    path = path or os.path.join(os.getcwd(), "attendance.log")
    logging.basicConfig(filename=path, level=logging.INFO,
                        format='%(asctime)s - %(levelname)s - %(message)s')
    return logging.getLogger("attendance_app")
