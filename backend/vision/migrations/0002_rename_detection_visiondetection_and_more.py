from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('policy', '0002_rename_policy_base_move_ty_457da7_idx_policy_base_move_ty_d01244_idx_and_more'),
        ('vision', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Detection',
            new_name='VisionDetection',
        ),
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_visi_vision__6e2097_idx',
            old_name='vision_dete_vision__5031a1_idx',
        ),
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_visi_furnitu_d8a561_idx',
            old_name='vision_dete_furnitu_673f6e_idx',
        ),
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_visi_yolo_cl_3e4f63_idx',
            old_name='vision_dete_yolo_cl_910fee_idx',
        ),
        migrations.RenameIndex(
            model_name='visiondetection',
            new_name='vision_visi_created_70a922_idx',
            old_name='vision_dete_created_d43349_idx',
        ),
    ]
