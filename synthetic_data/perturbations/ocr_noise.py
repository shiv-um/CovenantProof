import random
from pathlib import Path
from PIL import Image, ImageFilter
import pypdfium2 as pdfium


def apply_rotation(image: Image.Image, max_angle: float = 2.5) -> Image.Image:
    """Applies a realistic scanner skew between -max_angle and +max_angle degrees."""
    angle = random.uniform(-max_angle, max_angle)
    # Rotate with white background fill
    return image.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False, fillcolor=(255, 255, 255))


def apply_gaussian_blur(image: Image.Image, radius: float = 0.8) -> Image.Image:
    """Simulates slight optical camera defocus or thermal printer bleed."""
    return image.filter(ImageFilter.GaussianBlur(radius=radius))


def apply_salt_and_pepper_noise(image: Image.Image, prob: float = 0.008) -> Image.Image:
    """Injects random black and white speckles characteristic of dirty scanner glass."""
    img_copy = image.copy().convert("RGB")
    width, height = img_copy.size
    pixels = img_copy.load()

    num_noise_pixels = int(width * height * prob)
    for _ in range(num_noise_pixels):
        x = random.randint(0, width - 1)
        y = random.randint(0, height - 1)
        # 50% salt (white), 50% pepper (black)
        val = 255 if random.random() > 0.5 else 0
        pixels[x, y] = (val, val, val)

    return img_copy


def transpose_digits(text: str, swap_prob: float = 0.15) -> str:
    """
    Simulates human data entry or OCR digit transposition
    (e.g., swapping adjacent digits: 45000 -> 54000).
    """
    chars = list(text)
    for i in range(len(chars) - 1):
        if chars[i].isdigit() and chars[i + 1].isdigit():
            if random.random() < swap_prob:
                chars[i], chars[i + 1] = chars[i + 1], chars[i]
                break
    return "".join(chars)


def generate_perturbed_document(pdf_path: Path, output_image_path: Path) -> Path:
    """
    Renders the first page of a PDF and applies the full perturbation suite:
    skew, optical blur, and scanner noise.
    """
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found at: {pdf_path}")

    # Render page 0 at 150 DPI (scale=150/72 ≈ 2.08)
    pdf = pdfium.PdfDocument(str(pdf_path))
    page = pdf[0]
    pil_image = page.render(scale=2.08).to_pil()

    # Apply chained physical perturbations
    skewed = apply_rotation(pil_image, max_angle=2.0)
    blurred = apply_gaussian_blur(skewed, radius=0.6)
    noisy = apply_salt_and_pepper_noise(blurred, prob=0.005)

    output_image_path.parent.mkdir(parents=True, exist_ok=True)
    noisy.save(str(output_image_path), format="PNG")
    return output_image_path


if __name__ == "__main__":
    sample_pdf = Path("synthetic_data/output/cobalt_po.pdf")
    output_png = Path("synthetic_data/output/cobalt_po_perturbed.png")

    if not sample_pdf.exists():
        print(f"Sample PDF {sample_pdf} not found. Run pdf_generator.py first!")
    else:
        result_path = generate_perturbed_document(sample_pdf, output_png)
        print(f"Successfully generated perturbed document artifact: {result_path}")

        # Test digit transposition
        sample_val = "$45,000.00"
        transposed_val = transpose_digits(sample_val, swap_prob=1.0)
        print(f"Digit transposition test: {sample_val} -> {transposed_val}")