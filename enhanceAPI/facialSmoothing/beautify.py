import cv2
import numpy as np

from RedEye.red_eye import redEye


def get_roi(img, bounds, box_num):
    return img[bounds[box_num][1]:bounds[box_num][3],
               bounds[box_num][0]:bounds[box_num][2]]


def beautifyFace(img, config, bounds, removeRedEye):

    for box_num in range(len(bounds)):
        print(f'Face {box_num}: {bounds[box_num]}')

        roi = get_roi(img, bounds, box_num)

        temp_img = roi.copy()
        # ------------------------------RED EYE-----------------------------
        try:
            if removeRedEye:
                roi = redEye(roi)
        except Exception as e:
            print(e)
            continue

        hsv_img = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)

        hsv_mask = cv2.inRange(hsv_img,
                               np.array(config['image']['hsv_low']),
                               np.array(config['image']['hsv_high']))

        full_mask = cv2.merge((hsv_mask, hsv_mask, hsv_mask))

        blurred_img = cv2.bilateralFilter(roi,
                                          config['filter']['d'],
                                          config['filter']['sigma_1'],
                                          config['filter']['sigma_2'])

        masked_img = cv2.bitwise_and(blurred_img, full_mask)

        inverted_mask = cv2.bitwise_not(full_mask)

        masked_img2 = cv2.bitwise_and(temp_img, inverted_mask)

        smoothed_roi = cv2.add(masked_img2, masked_img)

        output_img = img.copy()

        output_img[bounds[box_num][1]:bounds[box_num][3],
                   bounds[box_num][0]:bounds[box_num][2]] = smoothed_roi
    return output_img
