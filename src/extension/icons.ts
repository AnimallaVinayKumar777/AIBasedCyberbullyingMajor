// Icon generation utility for ChirpGuard extension
export function generateIcons() {
  const sizes = [16, 32, 48, 128];
  const colors = {
    primary: '#1d9bf0',
    secondary: '#667eea',
    background: '#ffffff'
  };

  sizes.forEach(size => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;

    // Draw shield background
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.roundRect(2, 2, size - 4, size - 4, size * 0.2);
    ctx.fill();

    // Draw shield border
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw checkmark or shield symbol
    ctx.fillStyle = colors.background;
    ctx.font = `bold ${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛡️', size / 2, size / 2);

    // Convert to blob and save
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `icon${size}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  });
}