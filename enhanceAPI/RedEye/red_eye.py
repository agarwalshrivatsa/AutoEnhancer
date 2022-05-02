
import cv2
import numpy as np


def redEye(img):
    final = img.copy()
    model = cv2.CascadeClassifier("RedEye/haarcascade_eye.xml")
    eyes = model.detectMultiScale(
        img, scaleFactor=1.3, minNeighbors=4, minSize=(100, 100))
    print('Hiiii 1')
    print(eyes)
    for (x, y, w, h) in eyes:

        eye = img[y:y+h, x:x+w]
        print("HIiiii")
        blue, green, red = eye[:, :, 0], eye[:, :, 1], eye[:, :, 2]

        blueGreen = cv2.add(blue, green)

        mask = (red > 150) & (red > blueGreen)
        mask = mask.astype(np.uint8)*255

        filled = mask.copy()
        h, w = filled.shape[:2]
        tempMask = np.zeros((h+2, w+2), np.uint8)
        cv2.floodFill(filled, tempMask, (0, 0), 255)
        m2 = cv2.bitwise_not(filled)

        mask = cv2.dilate(m2 | mask, None, anchor=(-1, -1),
                          iterations=3, borderType=1, borderValue=1)

        avg = blueGreen / 2
        mask = mask.astype(np.bool)[:, :, np.newaxis]
        avg = avg[:, :, np.newaxis]

        output = eye.copy()

        output = np.where(mask, avg, output)

        final[y:y+h, x:x+w, :] = output

    return final
