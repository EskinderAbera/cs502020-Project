from django.forms.widgets import Textarea
from django.shortcuts import render
import random
from django import forms
from . import util
from markdown import Markdown

markdowner = Markdown()


class Edit(forms.Form):
    textarea = forms.CharField(widget=forms.Textarea(), label='')


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def entry_view(request, title):
    entries = util.list_entries()
    if title in entries:
        page = util.get_entry(title)
        page_convert = markdowner.convert(page)
        return render(request, "encyclopedia/entry_view.html", {
            "page_convert": page_convert,
            "title": title
        })
    else:
        return render(request, "encyclopedia/error.html", {
            "message": "Sorry there is no such page",
            "title": title
        })


def create_new_page(request):
    if request.method == 'POST':
        title = request.POST["title"]
        textarea = request.POST["textarea"]
        entries = util.list_entries()
        if title in entries:
            return render(request, "encyclopedia/error.html", {
                "message": "Content you are looking for is already exist!"
            })
        util.save_entry(title, textarea)
        page = util.get_entry(title)
        page_convert = markdowner.convert(page)
        return render(request, "encyclopedia/entry_view.html", {
            "page_convert": page_convert

        })
    else:
        return render(request, "encyclopedia/form.html")


def search_view(request):
    if request.method == 'POST':
        q = request.POST["q"]
        entries = util.list_entries()
        if q in entries:
            page = util.get_entry(q)
            page_convert = markdowner.convert(page)
            return render(request, "encyclopedia/entry_view.html", {
                "page_convert": page_convert
            })
        else:
            return render(request, "encyclopedia/error.html", {
                "message": "Page does not exist!"
            })


def random_view(request):
    if request.method == 'GET':
        entries = util.list_entries()
        num = random.randint(0, len(entries)-1)
        page = util.get_entry(entries[num])
        page_convert = markdowner.convert(page)
        return render(request, "encyclopedia/entry_view.html", {
            "page_convert": page_convert,
            "title": entries[num]
        })


def edit_view(request, title):
    if request.method == 'GET':
        page = util.get_entry(title)
        page_convert = markdowner.convert(page)
        context = {
            "edit": Edit(initial={'textarea': page_convert}),
            "title": title
        }
        return render(request, "encyclopedia/edit.html", context)

    if request.method == 'POST':
        textarea = request.POST["textarea"]
        util.save_entry(title, textarea)
        page = util.get_entry(title)
        page_convert = markdowner.convert(page)
        return render(request, "encyclopedia/entry_view.html", {
            "page_convert": page_convert
        })




