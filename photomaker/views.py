from django.shortcuts import render
from .forms import ImageUploadForm

# Create your views here.
def home(request):
    if request.method == 'POST':
        form = ImageUploadForm(request.POST, request.FILES)
        if form.is_valid():
            # Handle the uploaded file here
            image_file = form.cleaned_data['image_upload']
            # Do something with the image_file, such as saving it to a database or processing it
            return render(request, 'imageupload/success.html')
    else:
        form = ImageUploadForm()
    return render(request, 'photomaker/home.html', {'form': form})
    return render(request, 'photomaker/home.html')
