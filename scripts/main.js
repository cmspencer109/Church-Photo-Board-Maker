let cropper;

document.addEventListener('DOMContentLoaded', function() {
  const image = document.getElementById('image');
  const imageUpload = document.getElementById('imageUpload');
  
  if (image && typeof Cropper !== 'undefined') {
    cropper = new Cropper(image, {
      viewMode: 3,
      dragMode: 'move',
      guide: false,
      background: false,
      autoCrop: false,
      autoCropArea: 1,
      cropBoxMovable: false,
      cropBoxResizable: false,
      guides: false,
      center: false,
      highlight: false,
    });
  }

  if (imageUpload) {
    imageUpload.addEventListener('change', async function() {
      var file = this.files[0];
      if (!file) return;
      
      try {
        let processedFile = file;
        
        // Check if file is HEIC/HEIF and convert to JPEG
        if (file.type === 'image/heic' || file.type === 'image/heif' || 
            file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
          
          if (typeof heic2any !== 'undefined') {
            console.log('Converting HEIC/HEIF to JPEG...');
            processedFile = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.9
            });
          } else {
            alert('HEIC files are not supported. Please use JPEG or PNG files.');
            return;
          }
        }
        
        var reader = new FileReader();
        reader.onload = function(event) {
          if (cropper) {
            cropper.replace(event.target.result);
          }
        };
        
        reader.readAsDataURL(processedFile);
        
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try a different file.');
      }
    });
  }
});

function updateAdjustments(brightness, contrast, saturate, hueRotate) {
  const imgElement = document.querySelector('.cropper-canvas img');
  if (imgElement) {
    imgElement.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`;
  }
}

function downloadMemberPhoto(name) {
  var date = new Date().toISOString().split('T')[0];
  htmlToImage.toJpeg(document.getElementById('downloadable'), { quality: 1, canvasWidth: 1800, canvasHeight: 1200 })
    .then(function (dataUrl) {
      var link = document.createElement('a');
      link.download = name.replace(/ /g, '_') + '_' + date + '.jpg';
      link.href = dataUrl;
      link.click();
    })
    .catch(function (error) {
      console.error('Error downloading member photo:', error);
      alert('Could not download member photo. Try uploading a smaller image.')
    });
}
