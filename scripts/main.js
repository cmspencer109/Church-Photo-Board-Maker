const imageUpload = document.getElementById('imageUpload');
imageUpload.addEventListener('change', function() {
  var file = this.files[0];
  var reader = new FileReader();
  
  reader.onload = function(event) {
    cropper.replace(event.target.result);
  };

  reader.readAsDataURL(file);
});

const image = document.getElementById('image');
const cropper = new Cropper(image, {
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

function updateAdjustments(brightness, contrast, saturate, hueRotate) {
  const imgElement = document.querySelector('.cropper-canvas img');
  imgElement.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`;
}

function downloadMemberPhoto(name) {
  var date = new Date().toISOString().split('T')[0];
  htmlToImage.toJpeg(document.getElementById('downloadable'), { quality: 1, canvasWidth: 1800, canvasHeight: 1200 })
    .then(function (dataUrl) {
      var link = document.createElement('a');
      link.download = name.replace(/ /g, '_') + '_' + date + '.jpg';
      link.href = dataUrl;
      link.click();
    });
}
