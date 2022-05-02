import yaml
import cv2

from facialSmoothing import faceDetection, beautify


def load_configurations():

    with open('facialSmoothing/configs/configs.yaml', 'r') as config:
        return yaml.load(config, Loader=yaml.FullLoader)


def smoothFace(image, configs):
    config = load_configurations()
    removeRedEye = True if configs['redEye'] == 'true' else False
    try:
        output = process(image, config, removeRedEye)
    except Exception as e:
        print("Caught it")
        return None
    return output


def process(input, config, removeRedEye):

    detected_img, bounds = faceDetection.detectFace(input, config)

    output_img = beautify.beautifyFace(input, config,
                                       bounds, removeRedEye)

    return output_img


def get_shape(img):

    return img.shape[0], img.shape[1]
