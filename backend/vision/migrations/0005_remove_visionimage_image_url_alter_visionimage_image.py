import vision.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("vision", "0004_alter_visiondetection_options_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="visionimage",
            name="image_url",
        ),
        migrations.AlterField(
            model_name="visionimage",
            name="image",
            field=models.ImageField(
                blank=True, null=True, upload_to=vision.models.vision_image_upload_to
            ),
        ),
    ]
