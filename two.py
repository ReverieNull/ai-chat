# 修正角标显示问题，使用通用字符标注
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from statsmodels.api import OLS, add_constant

np.random.seed(42)

# 1. 生成样本数据
n = 100
mean = [1, 1]
cov = [[2, 1], [1, 2]]
X = np.random.multivariate_normal(mean=mean, cov=cov, size=n)
sigma_e = np.sqrt(2)
e = np.random.normal(loc=0, scale=sigma_e, size=n)
beta0_true = 2
beta1_true = 3
beta2_true = 1.5
Y = beta0_true + beta1_true * X[:,0] + beta2_true * X[:,1] + e

# 2. OLS估计
X_design = add_constant(X)
model = OLS(Y, X_design).fit()
beta_hat = model.params

# 3. 绘制修正标注的三维图
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

# 样本散点
scatter = ax.scatter(X[:,0], X[:,1], Y, alpha=0.7, color='#2E86AB', s=60, 
                     edgecolors='white', linewidth=0.5, label='样本数据点')

# 回归平面网格
X1_grid = np.linspace(X[:,0].min() - 0.5, X[:,0].max() + 0.5, 50)
X2_grid = np.linspace(X[:,1].min() - 0.5, X[:,1].max() + 0.5, 50)
X1_mesh, X2_mesh = np.meshgrid(X1_grid, X2_grid)
Y_mesh = beta_hat[0] + beta_hat[1] * X1_mesh + beta_hat[2] * X2_mesh

# 回归平面
surf = ax.plot_surface(X1_mesh, X2_mesh, Y_mesh, cmap='viridis', alpha=0.6, 
                       linewidth=0, antialiased=True, label='OLS回归平面')

# 【关键修正：角标改为括号说明，确保显示正常】
ax.set_xlabel('自变量 X(1)', fontsize=13, labelpad=12)  # X₁改为X(1)
ax.set_ylabel('自变量 X(2)', fontsize=13, labelpad=12)  # X₂改为X(2)
ax.set_zlabel('因变量 Y', fontsize=13, labelpad=12)
ax.set_title('多元线性回归模型：Y = β(0) + β(1)X(1) + β(2)X(2) + ε', 
             fontsize=15, fontweight='bold', pad=20)  # 系数下标用括号说明

ax.legend(fontsize=11, loc='upper right', bbox_to_anchor=(0.9, 0.9))
cbar = fig.colorbar(surf, ax=ax, shrink=0.5, aspect=8, pad=0.1)
cbar.set_label('Y 拟合值', fontsize=11)
ax.view_init(elev=25, azim=40)

plt.savefig('multiple_linear_regression_plane_final.png', dpi=300, bbox_inches='tight')
plt.show()

# 输出结果
print("="*60)
print("多元线性回归（X1,X2）OLS估计结果")
print("="*60)
print(f"真实系数：β0={beta0_true}, β1={beta1_true}, β2={beta2_true}")
print(f"估计系数：β0_hat={beta_hat[0]:.4f}, β1_hat={beta_hat[1]:.4f}, β2_hat={beta_hat[2]:.4f}")
print(f"拟合优度 R²：{model.rsquared:.4f}")
print("="*60)