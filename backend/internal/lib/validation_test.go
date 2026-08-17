package lib

import (
	"strings"
	"testing"
)

func TestCleanHTML(t *testing.T) {
	input := `<p style="text-align: center;"><strong>Teks Tebal di Tengah</strong></p>
<p style="text-align: justify;"><em>Teks Miring Rata Kiri Kanan</em></p>
<p><u>Teks Garis Bawah</u></p>
<ul><li>Item 1</li><li>Item 2</li></ul>
<ol><li>Nomor 1</li><li>Nomor 2</li></ol>
<figure class="image-insertion w-full my-8 text-center relative group" data-id="img-123" data-url="https://db.kemenag-baritoutara.com/storage/v1/object/public/cms-media/berita/sample.webp" data-filename="sample.webp" data-caption="Foto Upacara" data-date="17 Agustus 2026" contenteditable="false">
  <button type="button" class="edit-image-btn" aria-label="Edit Gambar">
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4v14h14v-7"></path></svg>
  </button>
  <img src="https://db.kemenag-baritoutara.com/storage/v1/object/public/cms-media/berita/sample.webp" alt="Foto Upacara" />
  <figcaption>Foto Upacara, 17 Agustus 2026</figcaption>
</figure>`

	cleaned := CleanHTML(input, 60000)

	if !strings.Contains(cleaned, "strong") && !strings.Contains(cleaned, "b>") {
		t.Errorf("Expected strong/b tag preserved, got: %s", cleaned)
	}
	if !strings.Contains(cleaned, "em") && !strings.Contains(cleaned, "i>") {
		t.Errorf("Expected em/i tag preserved, got: %s", cleaned)
	}
	if !strings.Contains(cleaned, "u>") {
		t.Errorf("Expected u tag preserved, got: %s", cleaned)
	}
	if !strings.Contains(cleaned, "text-align") {
		t.Errorf("Expected text-align preserved, got: %s", cleaned)
	}
	if !strings.Contains(cleaned, "data-id") {
		t.Errorf("Expected data-id on figure preserved, got: %s", cleaned)
	}
	if !strings.Contains(cleaned, "data-url") {
		t.Errorf("Expected data-url on figure preserved, got: %s", cleaned)
	}
	if !strings.Contains(cleaned, "figcaption") {
		t.Errorf("Expected figcaption preserved, got: %s", cleaned)
	}
}
