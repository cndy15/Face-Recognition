from flask import Flask, Response
import cv2
import mediapipe as mp

app = Flask(__name__)

mp_face = mp.solutions.face_detection
mp_draw = mp.solutions.drawing_utils
detector = mp_face.FaceDetection(min_detection_confidence=0.7)

camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = detector.process(rgb)

            if result.detections:
                for detect in result.detections:
                    mp_draw.draw_detection(frame, detect)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video')
def video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
