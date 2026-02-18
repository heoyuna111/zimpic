from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("vision", "0005_remove_visionimage_image_url_alter_visionimage_image"),
    ]

    operations = [
        migrations.AlterField(
            model_name="visiondetection",
            name="bbox_h",
            field=models.DecimalField(
                blank=True, decimal_places=6, max_digits=8, null=True
            ),
        ),
        migrations.AlterField(
            model_name="visiondetection",
            name="bbox_w",
            field=models.DecimalField(
                blank=True, decimal_places=6, max_digits=8, null=True
            ),
        ),
        migrations.AlterField(
            model_name="visiondetection",
            name="bbox_x",
            field=models.DecimalField(
                blank=True, decimal_places=6, max_digits=8, null=True
            ),
        ),
        migrations.AlterField(
            model_name="visiondetection",
            name="bbox_y",
            field=models.DecimalField(
                blank=True, decimal_places=6, max_digits=8, null=True
            ),
        ),
        migrations.AlterField(
            model_name="visiondetection",
            name="confidence",
            field=models.DecimalField(
                blank=True, decimal_places=5, max_digits=6, null=True
            ),
        ),
        migrations.AlterField(
            model_name="visiondetection",
            name="yolo_class",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
