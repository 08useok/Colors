# 모델 가공 도구

프로젝트 루트에 있던 Python 도구 9개를 이 폴더로 모았습니다. 게임 실행에는 필요하지 않습니다.

- `convert_*`: 캐릭터 모델·걷기 모션 변환 및 색상 변형
- `fix_blue_chin.py`: 블루 턱 메시 보정
- `merge_pink_meshes.py`: 핑크 FBX 메시 합치기

출력은 이 파일 위치를 기준으로 프로젝트의 `assets/3d/`에 저장합니다. 다운로드 원본 경로는 각 파일의 `SOURCE`, `SOURCE_DIR`, `INPUT` 설정을 확인하세요.

`bpy`를 사용하는 파일은 Blender에서 실행합니다. 프로젝트 루트에서 실행하는 예:

```text
blender --background --python tools/model-processing/convert_cyan_preview.py
```

`convert_characters_from_cyan.py`는 일반 Python과 Pillow를 사용합니다.

모델을 다시 생성하면 기존 에셋을 덮어씁니다. 이번 폴더 정리에서는 변환 스크립트를 실행하거나 에셋을 수정하지 않았습니다.
