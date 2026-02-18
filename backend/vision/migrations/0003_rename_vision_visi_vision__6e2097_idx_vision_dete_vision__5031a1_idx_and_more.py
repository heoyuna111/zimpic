from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vision', '0002_rename_detection_visiondetection_and_more'),
    ]

    operations = [
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_dete_vision__5031a1_idx',
            old_name='vision_visi_vision__6e2097_idx',
        ),
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_dete_furnitu_673f6e_idx',
            old_name='vision_visi_furnitu_d8a561_idx',
        ),
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_dete_yolo_cl_910fee_idx',
            old_name='vision_visi_yolo_cl_3e4f63_idx',
        ),
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_dete_created_d43349_idx',
            old_name='vision_visi_created_70a922_idx',
        ),
        migrations.AlterModelTable(
            name='visiondetection',
            table='vision_detection',
        ),
    ]
