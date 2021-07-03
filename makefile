init:
	@make delete-course-index
	@make create-index-templates
	@make index-course-documents

delete-course-index:
	node dist/scripts/delete-course-index.js

create-index-templates:
	node dist/scripts/create-index-templates.js

index-course-documents:
	node dist/scripts/index-course-documents.js
