from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>", views.entry_view, name="entry_view"),
    path("wiki/create_new_page/", views.create_new_page, name="create_new_page"),
    path("wiki/search_view/", views.search_view, name="search_view"),
    path("wiki/random_view/", views.random_view, name="random_view"),
    path("edit/<str:title>", views.edit_view, name="edit_view"),
]
