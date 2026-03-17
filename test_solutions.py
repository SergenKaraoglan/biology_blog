import numpy as np

def linear_forward(X: np.ndarray, W: np.ndarray, b: float) -> np.ndarray:
    return np.dot(X, W) + b

def relu(z: np.ndarray) -> np.ndarray:
    return np.maximum(0, z)

def mse_loss(preds: np.ndarray, targets: np.ndarray) -> float:
    return np.mean((preds - targets) ** 2)

def relu_derivative(z: np.ndarray) -> np.ndarray:
    return (z > 0).astype(float)

def update_weights(W: np.ndarray, dW: np.ndarray, lr: float) -> np.ndarray:
    return W - lr * dW

def forward_and_loss(X, W, b, target):
    z = linear_forward(X, W, b)
    a = relu(z)
    loss = mse_loss(a, target)
    return loss

def backprop(d_out: np.ndarray, a_hidden: np.ndarray) -> np.ndarray:
    return np.dot(a_hidden.T, d_out)

if __name__ == "__main__":
    print("Running Tests...")
    
    # 1. Linear
    res1 = linear_forward(np.array([[1,2]]), np.array([[0.5],[-0.5]]), 1.0)
    assert np.allclose(res1, np.array([[0.5]])), "Linear Forward Failed"
    
    # 2. ReLU
    res2 = relu(np.array([-1, 2]))
    assert np.allclose(res2, np.array([0, 2])), "ReLU Failed"
    
    # 3. MSE
    res3 = mse_loss(np.array([1., 2.]), np.array([1., 0.]))
    assert np.isclose(res3, 2.0), "MSE Failed"
    
    # 4. ReLU Deriv
    res4 = relu_derivative(np.array([-1, 1]))
    assert np.allclose(res4, np.array([0, 1])), "ReLU Deriv Failed"
    
    # 5. Update Weights
    res5 = update_weights(np.array([1.]), np.array([0.5]), 0.1)
    assert np.allclose(res5, np.array([0.95])), "Update Weights Failed"
    
    # 6. Pipeline
    res6 = forward_and_loss(np.array([[2., -1.]]), np.array([[0.5],[1.0]]), -0.5, 0.0)
    assert np.isclose(res6, 0.0), "Pipeline Failed"
    
    # 7. Backprop
    res7 = backprop(np.array([[0.5]]), np.array([[1.0, 2.0]]))
    assert np.allclose(res7, np.array([[0.5], [1.0]])), "Backprop Failed"
    
    print("All tests passed successfully!")
