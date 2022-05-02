import cv2
import yaml

from facialSmoothing import faceBeautification


def detectFace(input, config):

    model = cv2.dnn.readNetFromTensorflow(config['model']['modelPath'],
                                          config['model']['configPath'])

    h, w = faceBeautification.get_shape(input)

    blob = cv2.dnn.blobFromImage(input,
                                 1.0,
                                 config['image']['size'],
                                 config['image']['mean'],
                                 False,
                                 False)

    model.setInput(blob)
    dets = model.forward()
    detected_img = input.copy()

    bounds = []
    for i in range(dets.shape[2]):
        confidence = dets[0, 0, i, 2]
        threshold = config['model']['threshold']

        if confidence > threshold:
            x1 = int(dets[0, 0, i, 3] * w)
            y1 = int(dets[0, 0, i, 4] * h)
            x2 = int(dets[0, 0, i, 5] * w)
            y2 = int(dets[0, 0, i, 6] * h)
            bounds.append([x1, y1, x2, y2])

            top_left, btm_right = (x1, y1), (x2, y2)

            cv2.rectangle(detected_img,
                          top_left,
                          btm_right,
                          config['image']['bbox_color'],
                          2)
    return detected_img, bounds
