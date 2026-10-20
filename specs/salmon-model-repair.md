# 살몬 모델 보정 — 2026-10-20

## 원인

제공 ZIP의 실제 형상은 30,810개 삼각형이며 이미 모든 면에 스무스 셰이딩이 적용되어 있었습니다. 노멀맵을 끄거나 커스텀 노멀을 초기화해도 머리와 눈 주변의 굴곡이 남아 실제 형상과 생성 텍스처 양쪽에 문제가 있었습니다. 면 수 증가만으로 해결되는 문제는 아닙니다.

## 수정본

원본 몸체를 부드럽게 정리하고 경계 틈을 메웠습니다. 둥근 머리, 얼굴, 낚시찌 장식 하나를 새 형상으로 구성했습니다. 기존 형상을 완전히 유지하는 보정이 아니며 얼굴과 재질 표현이 달라집니다. 외부 텍스처 없는 단색 재질 7종을 사용합니다.

- FBX 31,499개 삼각형, GLB 재수입 31,498개 삼각형. 두 형식의 내보내기/불러오기에서 1개 차이가 있습니다.
- FBX·GLB 재수입 확인: 메시 23개, 재질 7개, 유효 좌표, 리깅 없음.
- 정면·측면 렌더를 확인했습니다. 애니메이션·자동 리깅·실제 게임 동작은 검증하지 않았습니다.
- 원본 ZIP은 변경하지 않았습니다. 살몬의 게임 구현·로스터 추가도 하지 않았습니다.
- Blender 저장은 성공했으며, 작업공간 밖 썸네일 캐시 저장 실패는 모델 파일 저장에 영향을 주지 않았습니다.

## 결과 파일

[수정본 ZIP](../output/salmon-model-review/salmon-fixed.zip) · [정면](../output/salmon-model-review/fixed-front.png) · [측면](../output/salmon-model-review/fixed-angle.png) · [재수입 검증](../output/salmon-model-review/export-validation.json)

재현 도구는 tools/inspect-salmon-model.py, repair-salmon-model.py, build-salmon-repair.py, validate-salmon-repair.py입니다. 원본 ZIP을 output/salmon-model-review/source/에 풀어 Blender 5.1.2에서 실행합니다. 원본·중간 비교 파일은 커밋하지 않습니다.
