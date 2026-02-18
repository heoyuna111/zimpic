from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vision', '0003_rename_vision_visi_vision__6e2097_idx_vision_dete_vision__5031a1_idx_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='visiondetection',
            options={'verbose_name': '객체 탐지 결과', 'verbose_name_plural': '2. 객체 탐지 결과 목록'},
        ),
        migrations.AlterModelOptions(
            name='visionimage',
            options={'ordering': ['sort_order', '-id'], 'verbose_name': '객체 탐지 이미지', 'verbose_name_plural': '1. 객체 탐지 이미지 목록'},
        ),
        migrations.AddField(
            model_name='visionimage',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='vision/'),
        ),
    ]
