import numpy as np
import cv2
from scipy.spatial import distance
from scipy.ndimage.filters import convolve
from scipy.sparse import diags, csr_matrix
from scipy.sparse.linalg import spsolve


def getSmoothWeights(IllMap, x, kernel, eps=1e-3):

    IllMapp = cv2.Sobel(IllMap, cv2.CV_64F, int(x == 1), int(x == 0), ksize=1)
    T = convolve(np.ones_like(IllMap), kernel, mode='constant')
    T = T / (np.abs(convolve(IllMapp, kernel, mode='constant')) + eps)
    return T / (np.abs(IllMapp) + eps)


def fuseImages(im, under_ex, over_ex,
               bc=1, bs=1, be=1):

    merge_mertens = cv2.createMergeMertens(bc, bs, be)
    images = [np.clip(x * 255, 0, 255).astype("uint8")
              for x in [im, under_ex, over_ex]]
    fused_images = merge_mertens.process(images)
    return fused_images


def getNeigh(p, n, m):

    i, j = p // m, p % m
    d = {}
    if i - 1 >= 0:
        d[(i - 1) * m + j] = (i - 1, j, 0)
    if i + 1 < n:
        d[(i + 1) * m + j] = (i + 1, j, 0)
    if j - 1 >= 0:
        d[i * m + j - 1] = (i, j - 1, 1)
    if j + 1 < m:
        d[i * m + j + 1] = (i, j + 1, 1)
    return d


def correct(im, gamma, lam, kernel, eps=1e-3):

    IllMap = np.max(im, axis=-1)

    xWeight = getSmoothWeights(IllMap, x=1, kernel=kernel, eps=eps)
    yWeight = getSmoothWeights(IllMap, x=0, kernel=kernel, eps=eps)

    n, m = IllMap.shape
    IllMap1D = IllMap.copy().flatten()

    row, column, data = [], [], []
    for p in range(n * m):
        diagonal = 0
        sparse = getNeigh(p, n, m).items()
        for q, (k, l, x) in sparse:
            weight = xWeight[k, l] if x else yWeight[k, l]
            row.append(p)
            column.append(q)
            data.append(-weight)
            diagonal += weight
        row.append(p)
        column.append(p)
        data.append(diagonal)
    X = csr_matrix((data, (row, column)), shape=(n * m, n * m))

    Id = diags([np.ones(n * m)], [0])
    Y = Id + lam * X
    refinedMap = spsolve(csr_matrix(Y), IllMap1D, permc_spec=None,
                         use_umfpack=True).reshape((n, m))

    refinedMap = np.clip(refinedMap, eps, 1) ** gamma

    refined3d = np.repeat(refinedMap[..., None], 3, axis=-1)
    correctedImage = im / refined3d
    return correctedImage


def enhanceImage(im, gamma, lam, sigma=3, bc=1, bs=1, be=1):

    size = 15
    kernel = np.zeros((size, size))
    for i in range(size):
        for j in range(size):
            kernel[i, j] = np.exp(-0.5 * (distance.euclidean((i, j),
                                  (size // 2, size // 2)) ** 2) / (sigma ** 2))

    normImage = im.astype(float) / 255.
    normImageInverse = 1 - normImage

    correctUnder = correct(
        normImage, gamma, lam, kernel)
    correctOver = 1 - \
        correct(normImageInverse, gamma, lam, kernel)

    merge_mertens = cv2.createMergeMertens(bc, bs, be)
    images = [np.clip(x * 255, 0, 255).astype("uint8")
              for x in [normImage, correctUnder, correctOver]]
    fusedImages = merge_mertens.process(images)

    final = np.clip(fusedImages * 255, 0, 255).astype("uint8")
    return final
