import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

fig, ax = plt.subplots(1, 1, figsize=(10, 10), facecolor='#0a0a1a')
ax.set_facecolor('#0a0a1a')
ax.set_aspect('equal')
ax.set_xlim(-1.15, 1.15)
ax.set_ylim(-1.15, 1.15)
ax.axis('off')

# Layer definitions: (radius_fraction, label_cn, label_en, depth_km, color)
layers = [
    (1.00,   '地壳',     'Crust',            '0–70 km',      '#b5e8b5'),
    (0.988,  '上地幔',   'Upper Mantle',     '70–660 km',    '#8ecae6'),
    (0.896,  '下地幔',   'Lower Mantle',     '660–2900 km',  '#5aa7d4'),
    (0.545,  '外核',     'Outer Core',       '2900–5150 km', '#e07b39'),
    (0.191,  '内核',     'Inner Core',       '5150–6371 km', '#f0c040'),
]

# Draw layers from outside in
for i, (r, label_cn, label_en, depth, color) in enumerate(layers):
    circle = plt.Circle((0, 0), r, fill=False, edgecolor=color, linewidth=1.5, linestyle='--')
    ax.add_patch(circle)

# Fill each layer with transparent color
radii = [l[0] for l in layers]
colors = [l[4] for l in layers]

for i, (r, label_cn, label_en, depth, color) in enumerate(layers):
    circle_fill = plt.Circle((0, 0), r, fill=True, facecolor=color, alpha=0.08, edgecolor='none')
    ax.add_patch(circle_fill)

# Redraw outlines on top
for i, (r, label_cn, label_en, depth, color) in enumerate(layers):
    circle = plt.Circle((0, 0), r, fill=False, edgecolor=color, linewidth=1.8, linestyle='--', alpha=0.9)
    ax.add_patch(circle)

# Draw annotation lines and labels
label_configs = [
    # (angle_deg, r_start, r_end, label_cn, label_en, depth)
    (40,  0.99,  1.09, layers[0][1], layers[0][2], layers[0][3], layers[0][4]),
    (55,  0.94,  1.09, layers[1][1], layers[1][2], layers[1][3], layers[1][4]),
    (70,  0.72,  1.09, layers[2][1], layers[2][2], layers[2][3], layers[2][4]),
    (85,  0.37,  1.09, layers[3][1], layers[3][2], layers[3][3], layers[3][4]),
    (100, 0.10,  1.09, layers[4][1], layers[4][2], layers[4][3], layers[4][4]),
]

for angle_deg, r_start, r_end, label_cn, label_en, depth, color in label_configs:
    angle = np.radians(angle_deg)
    x0 = r_start * np.cos(angle)
    y0 = r_start * np.sin(angle)
    x1 = r_end * np.cos(angle)
    y1 = r_end * np.sin(angle)
    
    ax.annotate('', xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle='-', color=color, lw=1.0, linestyle='dotted'))
    
    ax.text(x1 + 0.01, y1 + 0.005,
            f'{label_cn}  {label_en}\n{depth}',
            color=color, fontsize=9, va='center', ha='left',
            fontfamily='monospace',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='#0a0a1a', edgecolor=color, linewidth=0.5, alpha=0.85))

# Draw a vertical line through center to show cross-section
ax.plot([0, 0], [-1.0, 1.0], color='#ffffff', linewidth=0.5, alpha=0.15, linestyle=':')
ax.plot([-1.0, 1.0], [0, 0], color='#ffffff', linewidth=0.5, alpha=0.15, linestyle=':')

# Title
ax.text(0, -1.12, '地球内部结构  /  Earth Interior Structure',
        color='#dddddd', fontsize=13, ha='center', va='center', fontfamily='monospace',
        fontweight='bold')

# Center label
ax.text(0, 0, '地心\n6371 km', color='#f0c040', fontsize=8, ha='center', va='center',
        fontfamily='monospace', alpha=0.9)

plt.tight_layout()
plt.savefig('/home/ubuntu/.openclaw/workspace/earth_structure.png', dpi=150, bbox_inches='tight',
            facecolor='#0a0a1a', edgecolor='none')
print("Done")
