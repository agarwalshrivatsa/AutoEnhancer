from flask import Flask, request, send_from_directory, jsonify, send_file
from json import dumps
from io import BytesIO
import base64
from DUAL.enhanceDual import enhanceImage
from facialSmoothing.faceBeautification import smoothFace
from RedEye.red_eye import redEye
import cv2

app = Flask(__name__)


def processImage(image, configs):

    if configs['redEye'] == 'true' and configs['faceSmoothing'] == 'false' and configs['illumination'] == 'false':
        image = redEye(image)
        return image

    if configs['faceSmoothing'] == 'true':
        image = smoothFace(image, configs)

    if configs['illumination'] == 'true':
        image = enhanceImage(image, 0.6, 0.15)

    return image


def convertBase64ToFile(base64str):
    image_bytes = base64.b64decode(base64str)
    file = BytesIO(image_bytes)
    return file


@app.route('/', methods=['POST'])
def hello():
    print(request)
    imageTypeDict = {
        'image/jpeg': 'jpg',
        'image/bmp': 'bmp',
        'image/png': 'png'
    }
    if request.method == 'POST':
        data = request.form
        imageBytes = data['file']
        imageType = imageTypeDict[data['imageType']]
        fileData = convertBase64ToFile(imageBytes)
        with open(f"image.{imageType}", 'wb') as out:
            out.write(fileData.read())

        configs = {}
        configs['redEye'] = data['redEye']
        configs['illumination'] = data['illumination']
        configs['faceSmoothing'] = data['faceSmoothing']

        output = processImage(cv2.imread(f'image.{imageType}'), configs)
        if output is None:
            return jsonify({'status': 'NoFaceDetected'})
        else:
            cv2.imwrite(f'output.{imageType}', output)
            with open(f"output.{imageType}", "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read())
            base64_string = encoded_string.decode('utf-8')

            res = {'status': 'success', 'output': base64_string,
                   'imageType': data['imageType']}
            json_data = dumps(res, indent=2)
            return json_data


if __name__ == '__main__':
    app.run()
