from django import forms

class ImageUploadForm(forms.Form):
    image_upload = forms.ImageField()